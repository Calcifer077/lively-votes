import { TextField as TextFieldMui } from "@mui/material";

function TextField({
  label,
  name,
  value,
  onChange,
  error,
  helperText,
  ...rest
}) {
  return (
    <TextFieldMui
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      sx={{
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: "var(--lighter-purple)", // default border color
          },
          "&:hover fieldset": {
            borderColor: "var(--hover-indigo)", // on hover
          },
          "&.Mui-focused fieldset": {
            borderColor: "var(--active-indigo)", // when focused
          },
        },
      }}
      {...rest}
    />
  );
}

export default TextField;
