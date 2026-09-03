interface WhatsAppLinkProps {
    phone: string;
    className?: string;
    children?: React.ReactNode;
}

function formatWhatsAppUrl(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    const number = cleaned.startsWith('0') ? `233${cleaned.slice(1)}` : cleaned;
    return `https://wa.me/${number}`;
}

export default function WhatsAppLink({ phone, className, children }: WhatsAppLinkProps) {
    return (
        <a
            href={formatWhatsAppUrl(phone)}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
        >
            {children || phone}
        </a>
    );
}
