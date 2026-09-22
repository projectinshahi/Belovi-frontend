import type { Metadata } from "next";
import LegalPage from "../../components/common/LegalPage";

export const metadata: Metadata = {
  description:
    "How BELOVI handles order cancellations and refunds, including timelines and methods.",
};

export default function RefundCancellationPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Refund & Cancellation Policy"
      updated="16 July 2026"
    >
      <p>
        This policy explains when a BELOVI order can be cancelled and
        how refunds are processed. It sits alongside our Returns & Exchanges and
        Shipping policies and is governed by the applicable consumer laws of India.
      </p>

      <h2>1. Cancelling an order</h2>
      <ul>
        <li>
          You may cancel an order free of charge any time before it is dispatched
          from our studio.
        </li>
        <li>
          To cancel, email belovi2026@gmail.com or message us on WhatsApp with
          your order ID as early as possible.
        </li>
        <li>
          Once a parcel has been handed to the courier, it can no longer be
          cancelled; you may instead use our returns process after delivery.
        </li>
        <li>
          Made-to-order pieces cannot be cancelled once cutting has begun, as they
          are produced specifically for you.
        </li>
      </ul>

      <h2>2. Cancellations by us</h2>
      <p>
        We may occasionally cancel an order due to stock being unavailable, a
        pricing error, an unserviceable delivery address, or suspected fraud. In
        such cases we notify you and refund any amount paid in full.
      </p>

      <h2>3. When refunds apply</h2>
      <ul>
        <li>Orders cancelled before dispatch.</li>
        <li>
          Approved returns received in original, unworn condition within the
          returns window.
        </li>
        <li>Orders we are unable to fulfil.</li>
        <li>
          Verified cases of damaged, defective or incorrect items reported with an
          unboxing video within 24 hours of delivery.
        </li>
      </ul>

      <h2>4. Refund method and timeline</h2>
      <ul>
        <li>
          Refunds are issued to the original payment method used at checkout.
        </li>
        <li>
          Prepaid orders are refunded within five to seven working days of approval
          or of a returned piece passing inspection.
        </li>
        <li>
          It may take an additional few working days for your bank or card provider
          to reflect the credit.
        </li>
        <li>
          For eligible cash-on-delivery orders, refunds are made by bank transfer
          to details you share with us.
        </li>
      </ul>

      <h2>5. Deductions</h2>
      <p>
        Shipping charges already incurred and any cash-on-delivery handling fee are
        non-refundable, except where the return is due to our error. Reverse
        pickup fees, where applicable, may be deducted from the refund amount.
      </p>

      <h2>6. Contact</h2>
      <p>
        For any question about a cancellation or refund, write to
        belovi2026@gmail.com. We aim to reply within one working day.
      </p>
    </LegalPage>
  );
}
