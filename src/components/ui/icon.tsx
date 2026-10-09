import * as LucideIcons from "lucide-react";

type IconProps = {
    name: keyof typeof LucideIcons;
    size?: number;
    className?: string;
};

export function Icon({
    name,
    size = 20,
    className,
}: IconProps) {
    // @ts-ignore - Lucide icon types can be tricky with dynamic lookup
    const LucideIcon = LucideIcons[name];

    if (!LucideIcon) {
        console.warn(`Icon "${name}" not found in lucide-react`);
        return null;
    }

    // @ts-ignore
    return <LucideIcon size={size} className={className} />;
}
