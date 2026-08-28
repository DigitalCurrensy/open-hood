import Script from "next/script";

const GA_ID = /^G-[A-Z0-9]+$/i;

export function Ga4() {
  const id = process.env.NEXT_PUBLIC_GA_ID?.trim() ?? "";
  if (!GA_ID.test(id)) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga4-inline" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}',{anonymize_ip:true});`}
      </Script>
    </>
  );
}
