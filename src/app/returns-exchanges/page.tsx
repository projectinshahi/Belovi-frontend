import type { Metadata } from "next";
import LegalPage from "../../components/common/LegalPage";

export const metadata: Metadata = {
  description:
    "Our returns and exchange window, conditions and step-by-step process for BELOVI orders.",
};

export default function ReturnsExchangesPage() {
  return (
    <LegalPage eyebrow="Customer Care" title="Returns & Exchanges">
      <p>
        Buying clothing you cannot try on first is an act of trust. If a piece is
        not right for you, we make the exchange or return straightforward. Please
        read the window and conditions below before you start.
      </p>

      <h2>The window</h2>
      <p>
        You have seven days from the date of delivery to request a return or
        exchange. Requests raised after this window cannot be accepted, as the
        piece re-enters our small inventory.
      </p>

      <h2>Conditions</h2>
      <ul>
        <li>
          The garment must be unworn, unwashed and undamaged, with all original
          tags attached.
        </li>
        <li>
          It should carry no signs of wear, perfume, deodorant, stains or
          alteration.
        </li>
        <li>
          Please keep the original packaging so the piece travels back safely.
        </li>
        <li>
          For your protection, we ask for a clear, continuous unboxing video in
          case of a damaged, incorrect or missing item.
        </li>
      </ul>

      <h2>What we cannot accept</h2>
      <ul>
        <li>Pieces marked final sale or bought during clearance.</li>
        <li>Innerwear and any items noted as non-returnable on the product page.</li>
        <li>Made-to-order pieces cut specifically for you.</li>
      </ul>

      <h2>How it works</h2>
      <ul>
        <li>
          Write to belovi2026@gmail.com or message us on WhatsApp with your
          order ID and the reason for the return or exchange.
        </li>
        <li>
          Once approved, we arrange a reverse pickup where our courier partners
          operate, or share a return address if pickup is unavailable at your pin
          code.
        </li>
        <li>
          After the piece reaches us and passes a quick quality check, we confirm
          your exchange dispatch or begin your refund.
        </li>
      </ul>

      <h2>Exchanges</h2>
      <p>
        Exchanges are subject to stock in your preferred size or colour. If your
        choice is unavailable, we will offer the closest alternative or process a
        refund instead. The first size exchange on an order is free; a nominal
        reverse-shipping fee may apply thereafter.
      </p>

      <h2>Refund timelines</h2>
      <p>
        Approved refunds are issued to your original payment method within five to
        seven working days of the returned piece passing inspection. Please see our
        Refund & Cancellation policy for the full detail.
      </p>
    </LegalPage>
  );
}
