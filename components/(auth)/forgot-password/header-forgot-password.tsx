export function HeaderForgotPassword({ t }: Readonly<{ t: (key: string) => string }>) {
  return (
    <div className="flex flex-col items-center">
      <img src="/assets/images/logo.png" alt="ClearSight" className="h-9 w-auto" />
      <p className="my-5.5 text-xl leading-7 font-bold text-(--color-background-navy) uppercase">{t('forgotPassword.title')}</p>
    </div>
  );
}
