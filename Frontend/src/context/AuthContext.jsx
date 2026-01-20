import { createContext, useContext, useReducer } from "react";

const initialState = {
  userId: "",
  jwt: "",
  email: "",
};

// Reducer
function authReducer(authUserState, authAction) {
  switch (authAction.type) {
    case "login": {
      return {
        userId: authAction.id,
        jwt: authAction.jwt,
        email: authAction.email,
      };
    }
    case "logout": {
      return {
        userId: "",
        jwt: "",
        email: "",
      };
    }

    default: {
      throw new Error("Unkown action " + authAction.type);
    }
  }
}

const AuthContext = createContext(null);
const AuthContextDispatch = createContext(null);

function AuthProvider({ children }) {
  const [authUserState, dispatch] = useReducer(authReducer, initialState);

  return (
    <AuthContext value={authUserState}>
      <AuthContextDispatch value={dispatch}>{children}</AuthContextDispatch>
    </AuthContext>
  );
}

function useAuthContext() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("AuthContext was used outside of AuthProvider");
  }

  return context;
}

function useAuthContextDispatch() {
  const context = useContext(AuthContextDispatch);

  if (context === undefined) {
    throw new Error("AuthContextDispatch was used outside of AuthProvider");
  }

  return context;
}

// eslint-disable-next-line react-refresh/only-export-components
export { AuthProvider, useAuthContext, useAuthContextDispatch };
