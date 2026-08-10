import { ButtonLink } from "../components/ui/Button";
import Reveal from "../components/ui/Reveal";

export default function NotFound() {
  return (
    <main className="bg-ivory min-h-screen pt-[84px] flex-grow flex items-center">
      <div className="max-w-[1500px] w-full mx-auto px-6 sm:px-10 lg:px-16 py-24 sm:py-32">
        <Reveal className="max-w-2xl mx-auto text-center">
          <p className="eyebrow text-bronze-deep mb-6">Error 404</p>
          <h1 className="font-display font-light text-ink leading-[1.08] text-[clamp(2.5rem,7vw,5rem)]">
            Page not found
          </h1>
          <p className="mt-7 font-sans text-[15px] leading-[1.9] text-muted max-w-md mx-auto">
            The page you were looking for may have moved, been renamed, or is no
            longer here. Let us take you back to something more familiar.
          </p>
          <div className="mt-11 flex justify-center">
            <ButtonLink href="/" variant="outline" size="md">
              Return home
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
