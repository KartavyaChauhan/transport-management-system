import { Button, Container, Typography } from "@mui/material";

function App() {
  return (
    <Container maxWidth="md" sx={{ textAlign: "center", mt: 5 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        TMS Frontend is Live 🚀
      </Typography>
      <Button variant="contained" color="primary">
        Test Material UI Button
      </Button>
    </Container>
  );
}

export default App;