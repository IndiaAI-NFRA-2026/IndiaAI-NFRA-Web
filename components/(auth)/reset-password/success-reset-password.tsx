'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useRouter } from 'next/navigation';

interface SuccessResetPasswordProps {
  t: (key: string) => string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function SuccessResetPassword({ t, isOpen, setIsOpen }: Readonly<SuccessResetPasswordProps>) {
  const router = useRouter();

  const handleClose = () => {
    setIsOpen(false);
    router.push('/login');
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogContent className="rounded bg-(--color-background-color) p-0">
        <VisuallyHidden>
          <DialogTitle>{t('resetPassword.successTitle')}</DialogTitle>
        </VisuallyHidden>
        <div className="flex flex-col items-center px-6 py-8">
          <div className="flex items-center justify-center">
            <Image src="/assets/icons/success-icon.svg" alt="Success" width={70} height={70} />
          </div>

          <div className="my-6 space-y-2 text-center">
            <h2 className="text-2xl font-bold text-gray-800">{t('resetPassword.successTitle')}</h2>
            <p className="text-sm text-gray-600">{t('resetPassword.successDescription')}</p>
          </div>

          <Link href="/login" onClick={handleClose}>
            <Button
              variant="ghost"
              className="h-10 cursor-pointer rounded px-6 py-5 text-base leading-5.5 font-normal"
              style={{
                backgroundColor: 'var(--button-background)',
                color: 'var(--button-foreground)',
              }}
            >
              {t('resetPassword.backToLogin')}
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
