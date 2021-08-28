import "./App.css";
import {
  BrowserRouter,
  Route,
  Switch,
  Redirect,
  useLocation,
} from "react-router-dom";
import AuthUserProvider, { useAuthUser } from "./context/AuthUserContext";
import UserComparesProvider, {
  useUserCompares,
} from "./context/AuthUserContext";
import UserItemsProvider, { useUserItems } from "./context/AuthUserContext";
import Home from "./components/pages/Home";
import SignIn from "./components/pages/SignIn";
import SignUp from "./components/pages/SignUp";
import Search from "./components/pages/Search";
import Register from "./components/pages/Register";
import Edit from "./components/pages/Edit";
import History from "./components/pages/History";

// PrivateRouteの実装
const PrivateRoute = ({ ...props }) => {
  const authUser = useAuthUser();
  const isAuthenticated = authUser != null;
  if (isAuthenticated) {
    return <Route {...props} />;
  } else {
    console.log(`ログインしてください`);
    return (
      <Redirect
        to={{ pathname: "/signin", state: { from: props.location?.pathname } }}
      />
    );
  }
};

const UnAuthRoute = ({ ...props }) => {
  const authUser = useAuthUser();
  const isAuthenticated = authUser != null;
  const { from } = useLocation().state;

  if (isAuthenticated) {
    console.log(`すでにログイン済みです`);
    return <Redirect to={from ?? "/search"} />;
  } else {
    return <Route {...props} />;
  }
};

const App = () => {
  return (
    <AuthUserProvider>
      <BrowserRouter>
        <Switch>
          <UnAuthRoute exact path="/" component={Home} />
          <UnAuthRoute exact path="/signin" component={SignIn} />
          <UnAuthRoute exact path="/signup" component={SignUp} />
          <UserItemsProvider>
            <UserComparesProvider>
              <PrivateRoute path="/search" component={Search} exact />
              <PrivateRoute path="/register" component={Register} exact />
              <PrivateRoute path="/edit" component={Edit} exact />
              <PrivateRoute path="/history" component={History} exact />
            </UserComparesProvider>
          </UserItemsProvider>
        </Switch>
      </BrowserRouter>
    </AuthUserProvider>
  );
};

export default App;
