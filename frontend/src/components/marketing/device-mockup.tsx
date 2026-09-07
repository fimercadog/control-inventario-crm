import { ScreenshotFrame } from "@/components/marketing/screenshot-frame";
import { cn } from "@/lib/utils";

/** A product screenshot tilted in 3D perspective, Divi-style. */
export function DeviceMockup({
  src,
  alt,
  tilt = "right",
  className,
}: {
  src: string;
  alt: string;
  tilt?: "right" | "left" | "flat";
  className?: string;
}) {
  const transform =
    tilt === "right"
      ? "[transform:rotateY(-13deg)_rotateX(6deg)_rotateZ(1deg)]"
      : tilt === "left"
        ? "[transform:rotateY(13deg)_rotateX(6deg)_rotateZ(-1deg)]"
        : "";

  return (
    <div className={cn("[perspective:1700px]", className)}>
      <div className={cn("transition-transform duration-500 will-change-transform", transform)}>
        <ScreenshotFrame src={src} alt={alt} className="shadow-(--marketing-shadow)" />
      </div>
    </div>
  );
}
