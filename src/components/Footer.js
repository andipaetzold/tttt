import { faGithub, faPaypal } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function Footer() {
  return (
    <footer className="text-muted mt-4 mb-2 text-center">
      <p>
        <small>
          Made with ♥ for{" "}
          <a
            href="https://www.wtrl.racing"
            rel="noopener noreferrer"
            target="_blank"
          >
            WTRL
          </a>{" "}
          by{" "}
          <a
            href="https://zwiftpower.com/profile.php?z=1861132"
            rel="noopener noreferrer"
            target="_blank"
          >
            Andi P&auml;tzold
          </a>
        </small>
      </p>
      <p>
        <small>
          <a
            href="paypal.me/andipaetzold"
            rel="noopener noreferrer"
            target="_blank"
          >
            <FontAwesomeIcon icon={faPaypal} /> Donate via PayPal
          </a>
        </small>
      </p>
      <p>
        <small>
          <a
            href="https://github.com/andipaetzold/tttt"
            rel="noopener noreferrer"
            target="_blank"
          >
            <FontAwesomeIcon icon={faGithub} /> GitHub
          </a>
        </small>
      </p>
    </footer>
  );
}
