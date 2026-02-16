import { Button } from "@mui/material";

// If no function is provided it will just be a button without any click handler
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
