import { Button } from "@mui/material";

export default function NavbarButton({ children, onClick = () => {} }) {
  return (
    <Button
      onClick={onClick}
      variant="text"
      sx={{
        color: "var(--dark-gray)",
        "&:hover": {
          backgroundColor: "var(--hover-indigo)",
          color: "var(--light-gray)",
        },
        "&:active": {
          backgroundColor: "var(--active-indigo)",
          color: "var(--light-gray)",
        },
      }}
    >
      {children}
    </Button>
  );
}
