import React from "react";
// import clsx from "clsx";
import "typeface-roboto";
import { makeStyles, useTheme, Theme } from "@material-ui/core/styles";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import CssBaseline from "@material-ui/core/CssBaseline";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import InboxIcon from "@material-ui/icons/MoveToInbox";
import { MemoryRouter as Router, Link, Route, LinkProps, Switch } from "react-router-dom";
import { renderRoutes } from "react-router-config";
import Index from './pages/Index/index';
import WaterPressure from "./pages/WaterPressure/index";

type RouteProps = {
  name: string
  path: string
  exact?: boolean
  component: any
}

const routes: RouteProps[] = [
  {
    name: "首頁",
    path: "/",
    exact: true,
    component: Index
  },
  {
    name: "水壓偵測",
    path: "/water_pressure",
    component: WaterPressure
  }
];

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: "flex"
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0
  },
  drawerPaper: {
    width: drawerWidth
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: "0 8px",
    ...theme.mixins.toolbar,
    justifyContent: "flex-end"
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    }),
    marginLeft: 0
  }
}));

// const iOS = process.browser && /iPad|iPhone|iPod/.test(navigator.userAgent);

const RouteLink = (path: string) => React.forwardRef<HTMLAnchorElement, Partial<LinkProps>>(
  (props, ref) => <Link {...props} to={path} ref={ref as any} />
);

const AppBarTitle = (props: RouteProps) => {
  const { name, path, exact } = props
  return (
    <Route
      path={path}
      exact={exact}
      component={() => <Typography variant="h6" noWrap>{name}</Typography>}
    />
  )
}

function App() {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  function handleDrawerOpen() {
    setOpen(true);
  }

  function handleDrawerClose() {
    setOpen(false);
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Router>
        <AppBar position="fixed">
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="Open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              className={classes.menuButton}
            >
              <MenuIcon />
            </IconButton>
            <Switch>
              {routes.map((routeProps: RouteProps, index) => <AppBarTitle key={index} {...routeProps} />)}
            </Switch>
          </Toolbar>
        </AppBar>
        <SwipeableDrawer
          className={classes.drawer}
          open={open}
          onClose={handleDrawerClose}
          onOpen={handleDrawerOpen}
          classes={{
            paper: classes.drawerPaper
          }}
          // disableBackdropTransition={!iOS}
          // disableDiscovery={iOS}
        >
          <div className={classes.drawerHeader}>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === "ltr" ? (
                <ChevronLeftIcon />
              ) : (
                <ChevronRightIcon />
              )}
            </IconButton>
          </div>
          <Divider />

          <List>
            {routes.map(({ name, path }) => (
              <ListItem
                button
                key={name}
                component={RouteLink(path)}
                onClick={handleDrawerClose}
              >
                <ListItemIcon>
                  <InboxIcon />
                </ListItemIcon>
                <ListItemText primary={name} />
              </ListItem>
            ))}
          </List>
        </SwipeableDrawer>
        <main className={classes.content}>
          <div className={classes.drawerHeader} />
          <Switch>
            {renderRoutes(routes)}
          </Switch>
        </main>
      </Router>
    </div>
  );
}

export default App;
