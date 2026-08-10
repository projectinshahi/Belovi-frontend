import { ButtonLink } from '../../components/ui/Button';
import Breadcrumbs from '../../components/common/Breadcrumbs';

export default function OrderFailurePage() {
  return (
    <div className="min-h-screen bg-ivory pt-[84px] pb-24 px-6 sm:px-10 flex flex-col">
      {/* Breadcrumb pinned near the top; the card stays centred below. */}
      <Breadcrumbs className="max-w-[1500px] w-full mx-auto pt-6" />
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-xl w-full mx-auto text-center">
          <div className="bg-cream border border-line px-8 py-14 sm:px-14 sm:py-20">
            <p className="eyebrow text-bronze-deep mb-8">Payment Not Completed</p>

            <h1 className="font-display font-light text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.08] text-ink mb-6">
              Something went wrong.
            </h1>

            <p className="font-sans text-muted text-base leading-relaxed max-w-md mx-auto mb-12">
              Your payment could not be processed, so no charge was made. Your
              items are still saved in your cart. You can try again, or return to
              review them first.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <ButtonLink href="/checkout" variant="solid" size="md">
                Try Again
              </ButtonLink>
              <ButtonLink href="/cart" variant="outline" size="md">
                Return to Cart
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
