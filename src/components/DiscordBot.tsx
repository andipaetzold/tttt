import { Alert, Col, Row } from "react-bootstrap";
import discordLogo from "../assets/discord.svg";
import discordMarkLogo from "../assets/discordMark.svg";

export function DiscordBot() {
    return (
        <Alert variant="info">
            <Alert.Heading>Discord Bot</Alert.Heading>
            <Row>
                <Col xs={12} sm={4} md={2}>
                    <img src={discordLogo} alt="Discord Logo" className="d-block d-sm-none" />
                    <img src={discordMarkLogo} alt="Discord Logo" className="d-none d-sm-block" />
                </Col>
                <Col xs={12} sm={8} md={10}>
                    <p className="mt-2">
                        No need to run the Web App on a rider's computer and mess around with the audio setup. Just add the
                        TTT-Timer Discord Bot to your server and type <code>!t help</code> for details on how to use it.
                        After starting the timer, it will appear as a user within your call and coach you through the race.
                    </p>

                    <div className="d-flex justify-content-end">
                        <a
                            className="btn btn-light"
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://andipaetzold.github.io/tttt-discord"
                        >
                            Documentation
                        </a>

                        <a
                            className="btn btn-primary ml-2"
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://discord.com/api/oauth2/authorize?client_id=806979974594560060&amp;permissions=3155968&amp;scope=bot"
                        >
                            Install
                        </a>
                    </div>
                </Col>
            </Row>
        </Alert>
    );
}
