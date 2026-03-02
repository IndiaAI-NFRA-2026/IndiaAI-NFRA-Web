'use client';

import { useState, useEffect, useRef, startTransition } from 'react';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { Document, Page, pdfjs } from 'react-pdf';
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PdfPreviewProps {
  fileUrl: string;
}

export function PdfPreview({ fileUrl }: Readonly<PdfPreviewProps>) {
  const { t } = useLanguage();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isCheckingPdf, setIsCheckingPdf] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    const errorMessage = error.message || '';
    if (errorMessage.includes('403') || errorMessage.includes('Unexpected server response (403)')) {
      setPdfError(t('documentDetail.preview.pdfAccessDenied'));
    } else if (errorMessage.includes('404') || errorMessage.includes('Unexpected server response (404)')) {
      setPdfError(t('documentDetail.preview.pdfNotFound'));
    } else {
      setPdfError(errorMessage || t('documentDetail.preview.failedToLoadPdf'));
    }
  };

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setScale(1);

  useEffect(() => {
    if (!containerRef.current || !numPages) return;

    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const scrollBottom = scrollTop + containerHeight;

      let mostVisiblePage = 1;
      let maxVisibleArea = 0;

      for (let i = 1; i <= numPages; i++) {
        const pageElement = pageRefs.current[i];
        if (pageElement) {
          const pageTop = pageElement.offsetTop;
          const pageBottom = pageTop + pageElement.offsetHeight;
          const visibleTop = Math.max(scrollTop, pageTop);
          const visibleBottom = Math.min(scrollBottom, pageBottom);
          const visibleArea = Math.max(0, visibleBottom - visibleTop);

          if (visibleArea > maxVisibleArea) {
            maxVisibleArea = visibleArea;
            mostVisiblePage = i;
          }
        }
      }

      setCurrentPage((prev) => (prev !== mostVisiblePage ? mostVisiblePage : prev));
    };

    const container = containerRef.current;
    container.addEventListener('scroll', handleScroll, { passive: true });
    const timeoutId = setTimeout(handleScroll, 100);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [numPages]);

  const prevFileUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
    };
    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);
    return () => window.removeEventListener('resize', updateContainerWidth);
  }, []);

  useEffect(() => {
    const isFileUrlChanged = prevFileUrlRef.current !== fileUrl;

    if (isFileUrlChanged || prevFileUrlRef.current === null) {
      prevFileUrlRef.current = fileUrl;

      startTransition(() => {
        setPdfError(null);
        setCurrentPage(1);
        setScale(1);
        setNumPages(null);
        setIsCheckingPdf(true);
        pageRefs.current = {};
      });

      const checkPdfAccess = async () => {
        try {
          const response = await fetch(fileUrl, { method: 'HEAD' });
          if (!response.ok) {
            if (response.status === 403) {
              setPdfError(t('documentDetail.preview.pdfAccessDenied'));
            } else if (response.status === 404) {
              setPdfError(t('documentDetail.preview.pdfNotFound'));
            }
            setIsCheckingPdf(false);
            return;
          }
          setIsCheckingPdf(false);
        } catch {
          setIsCheckingPdf(false);
        }
      };

      checkPdfAccess();
    }
  }, [fileUrl, t]);

  return (
    <div className="flex h-screen max-h-screen w-full flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {t('documentDetail.preview.page')} {currentPage} {t('documentDetail.preview.of')} {numPages || '--'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="hover:bg-muted/80 h-8 px-3"
            title={t('documentDetail.preview.zoomOut')}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="min-w-16 text-center text-sm text-gray-600">{Math.round(scale * 100)}%</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={scale >= 3}
            className="hover:bg-muted/80 h-8 px-3"
            title={t('documentDetail.preview.zoomIn')}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetZoom}
            className="hover:bg-muted/80 h-8 px-3"
            title={t('documentDetail.preview.resetZoom')}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div ref={containerRef} className="min-h-0 flex-1 overflow-y-auto bg-gray-100">
        {pdfError && (
          <div className="flex h-full w-full items-center justify-center">
            <p className="text-sm text-(--color-destructive)">{pdfError}</p>
          </div>
        )}
        {!pdfError && isCheckingPdf && (
          <div className="flex items-center justify-center p-8">
            <p className="text-sm text-gray-600">{t('documentDetail.preview.loadingPdf')}</p>
          </div>
        )}
        {!pdfError && !isCheckingPdf && (
          <>
            <style>{`
              .react-pdf__Page { overflow: hidden !important; transition: opacity 0.2s ease-in-out; max-width: 100%; height: auto; }
              .react-pdf__Page__canvas { display: block !important; max-width: 100%; height: auto; }
              .react-pdf__Page__textContent, .react-pdf__Page__annotations { overflow: hidden !important; }
              .pdf-page-container { position: relative; display: flex; justify-content: center; width: 100%; margin-bottom: 16px; }
              .pdf-page-container:last-child { margin-bottom: 0; }
            `}</style>
            <div className="flex w-full flex-col items-center">
              <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center p-8">
                    <p className="text-sm text-gray-600">{t('documentDetail.preview.loadingPdf')}</p>
                  </div>
                }
                error={
                  <div className="flex items-center justify-center p-8">
                    <p className="text-sm text-(--color-destructive)">{t('documentDetail.preview.failedToLoadPdf')}</p>
                  </div>
                }
              >
                {numPages &&
                  Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
                    <div
                      key={`page-${pageNum}`}
                      ref={(el) => {
                        pageRefs.current[pageNum] = el;
                      }}
                      className="pdf-page-container"
                    >
                      <Page
                        pageNumber={pageNum}
                        scale={scale}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="shadow-lg"
                        width={containerWidth ? containerWidth - 32 : undefined}
                        loading={
                          <div className="flex items-center justify-center p-8">
                            <p className="text-sm text-gray-600">{t('documentDetail.preview.loadingPdf')}</p>
                          </div>
                        }
                      />
                    </div>
                  ))}
              </Document>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
