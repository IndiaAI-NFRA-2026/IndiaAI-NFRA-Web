'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { formatDate } from '@/lib/utils/helpers';
import { FlagBadge, StatusIndicator } from './fraud-status-badges';
import type { FraudTransaction } from './fraud-transaction-column';

interface TransactionFraudDetailModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  transaction: FraudTransaction | null;
  onOpenFalsePositiveModal?: () => void;
  onOpenConfirmFraudModal?: () => void;
  isComplianceOfficer?: boolean;
  modalView?: 'detail' | 'false-positive' | 'confirm-fraud';
  onConfirmFalsePositive?: (reason: string) => void;
  onConfirmFraud?: () => void;
  isLoading?: boolean;
}

export function TransactionFraudDetailModal({
  isOpen,
  setIsOpen,
  transaction,
  onOpenFalsePositiveModal,
  onOpenConfirmFraudModal,
  isComplianceOfficer = false,
  modalView = 'detail',
  onConfirmFalsePositive,
  onConfirmFraud,
  isLoading = false,
}: Readonly<TransactionFraudDetailModalProps>) {
  const { t } = useLanguage();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!transaction) return null;

  // Reset reason when modal view changes
  if (modalView === 'false-positive' && reason && error) {
    setError('');
  }

  const txnId = typeof transaction.txn_id === 'string' ? transaction.txn_id : transaction.txn_id?.value || '-';
  const dateValue = typeof transaction.date === 'string' ? transaction.date : transaction.date?.value;
  const date = dateValue ? formatDate(String(dateValue)) : '-';
  const descriptionValue = typeof transaction.description === 'string' ? transaction.description : transaction.description?.value;
  const description = descriptionValue || '-';

  let debitValue;
  if (typeof transaction.debit === 'number' || typeof transaction.debit === 'string') {
    debitValue = transaction.debit;
  } else {
    debitValue = transaction.debit?.value;
  }
  const debit = debitValue;

  let creditValue;
  if (typeof transaction.credit === 'number' || typeof transaction.credit === 'string') {
    creditValue = transaction.credit;
  } else {
    creditValue = transaction.credit?.value;
  }
  const credit = creditValue;
  const flag = transaction.flag;
  const status = transaction.status;

  // Mock data for status details (in real app, this would come from API)
  const transactionReason = status === 'false_positive' ? transaction.reason : '';
  const confirmBy = transaction?.updated_by_name;

  const handleClose = () => {
    setReason('');
    setError('');
    setIsOpen(false);
  };

  const handleFalsePositive = () => {
    onOpenFalsePositiveModal?.();
  };

  const handleConfirmFraud = () => {
    onOpenConfirmFraudModal?.();
  };

  const handleReasonChange = (value: string) => {
    setReason(value);
    if (error && value.trim()) {
      setError('');
    }
  };

  const handleConfirmFalsePositive = () => {
    if (!reason.trim()) {
      setError(t('fraudAnomaly.detail.modal.reasonRequired') || 'Reason is required');
      return;
    }
    setError('');
    onConfirmFalsePositive?.(reason);
    setReason('');
  };

  const handleConfirmFraudAction = () => {
    onConfirmFraud?.();
  };

  const showActionButtons = !isComplianceOfficer && !status && modalView === 'detail';

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogContent className="bg-upload-modal-background rounded p-0 sm:max-w-md">
        <button onClick={handleClose} className="absolute top-4 right-5 cursor-pointer rounded-full p-1.5 transition">
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader className="border-b border-(--color-filters-border) px-6 py-4 text-left">
          <DialogTitle className="text-base leading-6 font-medium">
            {modalView === 'false-positive'
              ? t('fraudAnomaly.detail.modal.falsePositiveTitle') || 'False Positive'
              : modalView === 'confirm-fraud'
                ? t('fraudAnomaly.detail.modal.confirmFraudTitle') || 'Confirm Fraud'
                : t('fraudAnomaly.detail.modal.title') || 'Transaction detail'}
          </DialogTitle>
        </DialogHeader>

        {modalView === 'false-positive' ? (
          <div className="px-6 py-4">
            <div className="space-y-4">
              <div>
                <label className="text-table-header-text-color mb-2 block text-sm leading-5 font-bold">
                  <span className="text-(--color-destructive)">* </span>
                  {t('fraudAnomaly.detail.reason') || 'Reason'}:
                </label>
                <Textarea
                  placeholder={t('fraudAnomaly.detail.modal.reasonPlaceholder') || 'E.g, Transaction was to a restaurant, not a casino'}
                  value={reason}
                  onChange={(e) => handleReasonChange(e.target.value)}
                  className={`min-h-[100px] resize-none ${error ? 'border-red-500' : ''}`}
                />
                {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
              </div>
            </div>
          </div>
        ) : modalView === 'confirm-fraud' ? (
          <div className="px-6 py-4">
            <p className="text-sm leading-6 text-(--color-sidebar-foreground)">
              {t('fraudAnomaly.detail.modal.confirmFraudMessage') || 'Are you sure this transaction is fraud?'}
            </p>
          </div>
        ) : (
          <div className="px-4">
            <div className="space-y-4 border border-(--color-filters-border) p-4">
              {/* TXN ID */}
              <div className="flex items-start justify-between">
                <p className="text-table-header-text-color text-sm leading-5.5 font-bold">{t('fraudAnomaly.detail.txnId') || 'TXN ID'}:</p>
                <p className="text-sm leading-5.5 font-normal text-(--color-sidebar-foreground)">{txnId}</p>
              </div>

              {/* Date */}
              {date && date !== '-' && (
                <div className="flex items-start justify-between">
                  <p className="text-table-header-text-color text-sm leading-5.5 font-bold">{t('fraudAnomaly.detail.date') || 'Date'}:</p>
                  <p className="text-sm leading-5.5 font-normal text-(--color-sidebar-foreground)">{date}</p>
                </div>
              )}

              {/* Description */}
              {description && description !== '-' && (
                <div className="flex items-start justify-between">
                  <p className="text-table-header-text-color text-sm leading-5.5 font-bold">
                    {t('fraudAnomaly.detail.description') || 'Description'}:
                  </p>
                  <p className="text-sm leading-5.5 font-normal text-(--color-sidebar-foreground)">{description}</p>
                </div>
              )}

              {/* Credit or Debit */}
              {credit && (
                <div className="flex items-start justify-between">
                  <p className="text-table-header-text-color text-sm leading-5.5 font-bold">
                    {t('fraudAnomaly.detail.credit') || 'Credit'}:
                  </p>
                  <p className="text-sm leading-5.5 font-normal text-(--color-sidebar-foreground)">{credit}</p>
                </div>
              )}
              {debit && (
                <div className="flex items-start justify-between">
                  <p className="text-table-header-text-color text-sm leading-5.5 font-bold">{t('fraudAnomaly.detail.debit') || 'Debit'}:</p>
                  <p className="text-sm leading-5.5 font-normal text-(--color-sidebar-foreground)">{debit}</p>
                </div>
              )}

              {/* Flag */}
              {flag && (
                <div className="flex items-start justify-between">
                  <p className="text-table-header-text-color text-sm leading-5.5 font-bold">{t('fraudAnomaly.detail.flag') || 'Flag'}:</p>
                  <FlagBadge flag={flag} />
                </div>
              )}

              {/* Status (only show if has status) */}
              {status && (
                <>
                  <div className="flex items-start justify-between">
                    <p className="text-table-header-text-color text-sm leading-5.5 font-bold">
                      {t('fraudAnomaly.detail.status') || 'Status'}:
                    </p>
                    <StatusIndicator status={status} showDot={true} textSize="sm" />
                  </div>

                  {/* Reason */}
                  {status === 'false_positive' && (
                    <div className="flex items-start justify-between">
                      <p className="text-table-header-text-color text-sm leading-5.5 font-bold">
                        {t('fraudAnomaly.detail.reason') || 'Reason'}:
                      </p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="max-w-[200px] truncate text-right text-sm leading-5.5 font-normal text-(--color-sidebar-foreground)">
                              {transactionReason}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-h-[200px] max-w-[300px] overflow-y-auto">
                            <p className="wrap-break-word">{transactionReason}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}

                  {/* Confirm by */}
                  {confirmBy && (
                    <div className="flex items-start justify-between">
                      <p className="text-table-header-text-color text-sm leading-5.5 font-bold">
                        {t('fraudAnomaly.detail.confirmBy') || 'Confirm by'}:
                      </p>
                      <p className="text-sm leading-5.5 font-normal text-(--color-sidebar-foreground)">{confirmBy}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Footer with buttons */}
        <div className="border-t border-(--color-filters-border) px-6 py-4">
          {modalView === 'false-positive' ? (
            <div className="flex items-center justify-end gap-3">
              <Button type="outline" title={t('fraudAnomaly.detail.modal.cancel') || 'Cancel'} onClick={handleClose} disabled={isLoading} />
              <Button
                onClick={handleConfirmFalsePositive}
                title={
                  isLoading
                    ? t('fraudAnomaly.detail.modal.processing') || 'Processing...'
                    : t('fraudAnomaly.detail.modal.confirm') || 'Confirm'
                }
                isLoading={isLoading}
                disabled={isLoading}
              />
            </div>
          ) : modalView === 'confirm-fraud' ? (
            <div className="flex items-center justify-end gap-3">
              <Button type="outline" title={t('fraudAnomaly.detail.modal.cancel') || 'Cancel'} onClick={handleClose} disabled={isLoading} />
              <Button
                onClick={handleConfirmFraudAction}
                title={
                  isLoading
                    ? t('fraudAnomaly.detail.modal.processing') || 'Processing...'
                    : t('fraudAnomaly.detail.modal.confirm') || 'Confirm'
                }
                isLoading={isLoading}
                disabled={isLoading}
              />
            </div>
          ) : showActionButtons ? (
            // If no status and not compliance officer, show all three buttons
            <div className="flex items-center justify-end gap-3">
              <Button type="outline" title={t('fraudAnomaly.detail.modal.close') || 'Close'} onClick={handleClose} />
              <Button
                type="primary"
                onClick={handleFalsePositive}
                title={t('fraudAnomaly.detail.modal.falsePositive') || 'False Positive'}
              />
              <Button type="danger" onClick={handleConfirmFraud} title={t('fraudAnomaly.detail.modal.confirmFraud') || 'Confirm Fraud'} />
            </div>
          ) : (
            // If has status or is compliance officer, only show Close button
            <div className="flex justify-end">
              <Button type="outline" title={t('fraudAnomaly.detail.modal.close') || 'Close'} onClick={handleClose} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
