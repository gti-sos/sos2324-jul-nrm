<script lang="ts">
    import { Container, Row, Col, Nav, NavItem, NavLink} from '@sveltestrap/sveltestrap';

</script>
<Container>
  <Row>
    <Nav underline>
      <Col xs=3>
        <NavItem>
          <NavLink href="/" >Home</NavLink>
        </NavItem>
      </Col>
      <Col xs=3>
        <NavItem>
          <NavLink href="/ufc-events-data">API</NavLink>
        </NavItem>
      </Col>
      <Col xs=3>
        <NavItem>
          <NavLink href="/about">About</NavLink>
        </NavItem>
      </Col>
      <Col xs=3>
        <NavItem>
          <NavLink href="/integrations">Integrations</NavLink>
        </NavItem>
      </Col>
    </Nav>
  </Row>
</Container>



