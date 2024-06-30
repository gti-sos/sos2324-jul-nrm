<script lang="ts">
    import { Container, Row, Col, Nav, NavItem, Dropdown, DropdownItem, DropdownToggle, DropdownMenu, NavLink} from '@sveltestrap/sveltestrap';

</script>
<Container>
  <Row>
    <Nav underline>
      <Col xs=1>
        <NavItem>
          <NavLink href="/" >Home</NavLink>
        </NavItem>
      </Col>
      <NavItem>
        <NavLink href="/ufc-events-data">ufc-events-data</NavLink>
      </NavItem>
      <Col xs=1>
        <NavItem>
          <NavLink href="/about">About</NavLink>
        </NavItem>
      </Col>
      <Col xs=1>
        <NavItem>
          <NavLink href="/integrations">Integrations</NavLink>
        </NavItem>
        </Col>
    </Nav>
  </Row>
</Container>



