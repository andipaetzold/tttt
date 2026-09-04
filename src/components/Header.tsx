import { faBiking } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Navbar } from "react-bootstrap";

export function Header() {
  return (
    <Navbar bg="light" className="mb-2">
      <Navbar.Brand className="mx-auto">
        <FontAwesomeIcon icon={faBiking} /> Team Time Trial Timer{" "}
        <FontAwesomeIcon icon={faBiking} />
      </Navbar.Brand>
    </Navbar>
  );
}
