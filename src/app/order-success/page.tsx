import { ButtonLink } from '../../components/ui/Button';
import Breadcrumbs from '../../components/common/Breadcrumbs';

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-ivory pt-[84px] pb-24 px-6 sm:px-10 flex flex-col">
      {/* Breadcrumb pinned near the top; the card stays centred in the space
          below, so the trail reads normally instead of floating mid-screen. */}
      <Breadcrumbs className="max-w-[1500px] w-full mx-auto pt-6" />
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-xl w-full mx-auto text-center">
          <div className="bg-cream border border-line px-8 py-14 sm:px-14 sm:py-20">
          <p className="eyebrow text-bronze-deep mb-8">Order Confirmed</p>

          <h1 className="font-display font-light text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.08] text-ink mb-6">
            Thank you.
          </h1>

          <p className="font-sans text-muted text-base leading-relaxed max-w-md mx-auto mb-12">
            We have received your order and begun preparing it. You will find the
            details and status in your profile. Each piece is checked by hand
            before it leaves Kochi.
          </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <ButtonLink href="/profile" variant="solid" size="md">
                View My Orders
              </ButtonLink>
              <ButtonLink href="/products" variant="outline" size="md">
                Continue Shopping
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
