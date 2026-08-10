import type { Metadata } from "next";
import LegalPage from "../../components/common/LegalPage";

export const metadata: Metadata = {
  description:
    "Dispatch windows, delivery timelines and shipping charges for BELOVI orders across India.",
};

export default function ShippingInformationPage() {
  return (
    <LegalPage eyebrow="Customer Care" title="Shipping Information">
      <p>
        Every BELOVI order is packed by hand at our studio in Kochi,
        Kerala. Because we work in considered batches rather than mass volume, we
        would rather send your garment out well than in a hurry. Here is what to
        expect once you place an order.
      </p>

      <h2>Where we ship</h2>
      <p>
        We currently ship across India, to every state and union territory served
        by our courier partners. All prices and charges are in Indian Rupees
        (₹ INR). International shipping is not available yet.
      </p>

      <h2>Dispatch windows</h2>
      <ul>
        <li>
          In-stock pieces are dispatched within one to two working days of your
          order being confirmed.
        </li>
        <li>
          Made-to-order and pre-order pieces carry their own timeline, noted
          clearly on the product page before you buy.
        </li>
        <li>
          Orders placed on Sundays or public holidays are processed on the next
          working day.
        </li>
      </ul>

      <h2>Delivery timelines</h2>
      <p>
        Timelines below are counted from the day your order is dispatched, not the
        day you place it.
      </p>
      <ul>
        <li>Kerala and metro cities: two to four working days.</li>
        <li>Rest of India: four to seven working days.</li>
        <li>
          Remote and non-serviceable pin codes may take a little longer; we will
          be in touch if that is the case.
        </li>
      </ul>

      <h2>Shipping charges</h2>
      <ul>
        <li>Complimentary shipping on all prepaid orders above ₹2,499.</li>
        <li>A flat ₹99 applies to prepaid orders below ₹2,499.</li>
        <li>
          Cash on delivery, where available, carries an additional ₹79 handling
          fee shown at checkout.
        </li>
      </ul>

      <h2>Tracking your order</h2>
      <p>
        Once your parcel leaves the studio, we email a tracking link and courier
        name. You can also use the Track Your Order page or message us on WhatsApp
        with your order ID for an update.
      </p>

      <h2>A note on delays</h2>
      <p>
        Monsoon weather, courier backlogs and festive-season volume can stretch
        these estimates. We keep timelines honest rather than optimistic, and we
        will always write to you if something needs longer.
      </p>
    </LegalPage>
  );
}
