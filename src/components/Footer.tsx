import { faGithub, faPaypal } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function Footer() {
    return (
        <footer className="text-muted mt-4 mb-2 text-center">
            <p>
                <small>
                    Made with ♥ for{" "}
                    <a href="https://www.wtrl.racing" rel="noopener noreferrer" target="_blank" className="link-decoration">
                        WTRL
                    </a>{" "}
                    by{" "}
                    <a href="mailto:tttt@andipaetzold.com" rel="noopener noreferrer" target="_blank" className="link-decoration">
                        Andi P&auml;tzold
                    </a>
                </small>
            </p>
            <p>
                <small>
                    <a href="https://paypal.me/andipaetzold" rel="noopener noreferrer" target="_blank" className="link-decoration">
                        <FontAwesomeIcon icon={faPaypal} /> Donate via PayPal
                    </a>
                </small>
            </p>
            <p>
                <small>
                    <a href="https://github.com/andipaetzold/tttt" rel="noopener noreferrer" target="_blank" className="link-decoration">
                        <FontAwesomeIcon icon={faGithub} /> GitHub
                    </a>
                </small>
            </p>
        </footer>
    );
}
