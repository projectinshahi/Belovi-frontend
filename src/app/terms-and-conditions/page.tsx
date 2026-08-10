import type { Metadata } from "next";
import LegalPage from "../../components/common/LegalPage";

export const metadata: Metadata = {
  description:
    "Read the Terms & Conditions of BELOVI. Learn about the rules for using our website.",
};

export default function TermsAndConditionsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms & Conditions" updated="11 July 2026">
      <p>
        Welcome to BELOVI. By accessing our website or placing an
        order, you agree to the following Terms &amp; Conditions. These terms are
        governed by the applicable laws of India, including the Information
        Technology Act, 2000, the Consumer Protection Act, 2019, and other
        applicable laws and regulations.
      </p>

      <h2>1. Order Confirmation</h2>
      <ul>
        <li>
          Customers must provide accurate shipping details and a valid contact
          number while placing an order.
        </li>
        <li>
          To confirm Cash on Delivery (COD) orders, an advance payment of 10% of
          the product value is required. The remaining amount is payable at the
          time of delivery.
        </li>
      </ul>

      <h2>2. Delivery</h2>
      <ul>
        <li>Prepaid Orders: Estimated delivery within 2–3 business days.</li>
        <li>Cash on Delivery (COD): Estimated delivery within 3–5 business days.</li>
        <li>
          Delivery timelines are estimates and may vary depending on location,
          courier availability, or unforeseen circumstances.
        </li>
      </ul>

      <h2>3. Unboxing &amp; Delivery Claims</h2>
      <ul>
        <li>
          Customers are kindly requested to record a continuous unboxing video
          while opening the package.
        </li>
        <li>
          Any claim regarding transit damage, missing items, or incorrect products
          must be reported within 24 hours of delivery with the unboxing video.
        </li>
        <li>Claims submitted without a valid unboxing video may not be accepted.</li>
      </ul>

      <h2>4. Returns &amp; Exchanges</h2>
      <ul>
        <li>
          Eligible pieces may be returned or exchanged within seven days of
          delivery, subject to our Returns &amp; Exchanges policy.
        </li>
        <li>
          Garments must be unworn, unwashed and undamaged, with original tags
          attached.
        </li>
        <li>
          Approved refunds are issued to the original payment method, as set out in
          our Refund &amp; Cancellation policy.
        </li>
      </ul>

      <h2>5. Product Information</h2>
      <p>
        We make every effort to ensure product descriptions, specifications, and
        images are accurate. However, minor variations in packaging, color, or
        design may occur, particularly with naturally dyed and handled fabrics.
      </p>

      <h2>6. Pricing &amp; Orders</h2>
      <p>
        BELOVI reserves the right to modify prices, discontinue
        products, or cancel orders due to pricing errors, stock unavailability,
        suspected fraud, or other genuine reasons.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        BELOVI shall not be liable for any indirect, incidental, or
        consequential loss arising from the use of our products or services, except
        as required under applicable Indian law.
      </p>

      <h2>8. Governing Law</h2>
      <p>
        These Terms &amp; Conditions shall be governed by the laws of India. Any
        disputes arising from the use of our website or services shall be subject to
        the exclusive jurisdiction of the competent courts in Kochi (Ernakulam),
        Kerala.
      </p>

      <h2>Contact Us</h2>
      <p>
        <strong>BELOVI Private Limited</strong>
        <br />
        Registered in Kochi, Ernakulam
        <br />
        Kerala, India
      </p>
      <p>
        Email:{" "}
        <a href="mailto:care@belovi.in">care@belovi.in</a>
      </p>
    </LegalPage>
  );
}
