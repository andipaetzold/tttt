import { Container, Navbar } from "react-bootstrap";

export function Header() {
  return (
    <Navbar bg="light" className="mb-2">
      <Container>
        <Navbar.Brand>Team Time Trial Timer</Navbar.Brand>
      </Container>
    </Navbar>
  );
}
