import type { Metadata } from "next";
import LegalPage from "../../components/common/LegalPage";

export const metadata: Metadata = {
  description:
    "The formal shipping policy for BELOVI, covering processing, delivery, charges and liability.",
};

export default function ShippingPolicyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Shipping Policy" updated="16 July 2026">
      <p>
        This Shipping Policy sets out how BELOVI Private Limited,
        Kochi, Kerala, processes and delivers orders. By placing an order you agree
        to the terms below, which are governed by the applicable laws of India.
      </p>

      <h2>1. Order processing</h2>
      <p>
        Orders are processed on working days, Monday to Saturday, excluding public
        holidays. In-stock items are dispatched within one to two working days of
        payment confirmation. Made-to-order and pre-order items carry the timeline
        stated on their product page.
      </p>

      <h2>2. Serviceable areas</h2>
      <p>
        We deliver across India through our third-party courier partners. Delivery
        is subject to pin-code serviceability. If your address cannot be serviced,
        we will contact you to arrange an alternative or issue a full refund.
      </p>

      <h2>3. Delivery timelines</h2>
      <ul>
        <li>Kerala and metro cities: typically two to four working days after dispatch.</li>
        <li>Rest of India: typically four to seven working days after dispatch.</li>
        <li>
          Timelines are estimates provided by our courier partners and are not
          guaranteed. They may vary due to location, weather, or circumstances
          beyond our control.
        </li>
      </ul>

      <h2>4. Shipping charges</h2>
      <ul>
        <li>Prepaid orders above ₹2,499 ship free of charge.</li>
        <li>Prepaid orders below ₹2,499 carry a flat shipping charge of ₹99.</li>
        <li>
          Cash on delivery, where offered, carries an additional handling fee of
          ₹79. All charges are shown at checkout before payment.
        </li>
      </ul>

      <h2>5. Tracking</h2>
      <p>
        Once your order is dispatched, we send the tracking number and courier
        details to your registered email. You can also request an update through
        the Track Your Order page or on WhatsApp using your order ID.
      </p>

      <h2>6. Delivery attempts and failure</h2>
      <p>
        Couriers ordinarily make up to three delivery attempts. If a parcel is
        returned to us as undelivered because of an incorrect address, an
        unreachable contact, or repeated non-availability, we will contact you to
        arrange re-dispatch. Re-shipping charges may apply.
      </p>

      <h2>7. Transit damage</h2>
      <p>
        We pack each order carefully. Should a parcel arrive damaged, please report
        it within 24 hours of delivery along with a clear, continuous unboxing
        video, so we can raise a claim with the courier and resolve it for you.
      </p>

      <h2>8. Liability</h2>
      <p>
        Risk in the goods passes to you on delivery. BELOVI is not
        liable for delays or non-delivery caused by events outside our reasonable
        control, including weather, strikes, or courier disruption, except as
        required under applicable Indian law.
      </p>

      <h2>9. Contact</h2>
      <p>
        For any shipping query, write to care@belovi.in or message us on
        WhatsApp. Our studio hours are Monday to Saturday, 10am to 6pm IST.
      </p>
    </LegalPage>
  );
}
