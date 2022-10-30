import React from 'react';
import {browserHistory, Route, Router} from "react-router";
import OrderList from "../orders/list";
import Homepage from "../homepage/homepage";
import V from "../v";
import OrderDetail from "../orders/order-detail";
import FakeFace from "../fake-face";
import ImageBase64 from "../tools/image-base64";
import LoginPage from "../auth/login-page";
import Orders from "../admin/orders";
import Settings from "../admin/settings";
import Config from "../admin/config";
import NotFound404 from "../errors/404";
import ErrorBoundary from "../error-boundary";
import Auth from "../auth/auth";
import {LoadingProvider} from "../loading-context";

function isUserAuthenticated(nextState, replaceState) {
    if (!Auth.isUserAuthenticated()) {
        replaceState({
            nextPathname: nextState.location.pathname
        }, '/sign-in');
    }
}

const ClientRoutes = () => {
    return <LoadingProvider>
        <ErrorBoundary>
            <Router history={browserHistory}>
                <Route path="/orders" component={OrderList}/>
                <Route path="/" component={Homepage}/>
                <Route path="/v/:vid" component={V}/>
                <Route path="/v/:vid/:orderId" component={V}/>
                <Route path="/order/:orderId" component={OrderDetail}/>
                <Route path="/fake-face" component={FakeFace}/>
                <Route path="/tools/image-base64" component={ImageBase64}/>
                <Route path="/sign-in" component={LoginPage}/>
                <Route path="/admin/orders" component={Orders} onEnter={isUserAuthenticated}/>
                <Route path="/admin/settings" component={Settings} onEnter={isUserAuthenticated}/>
                <Route path="/admin/api/config" component={Config} onEnter={isUserAuthenticated}/>
                <Route path="/*" component={NotFound404}/>
            </Router>
        </ErrorBoundary>
    </LoadingProvider>
}

export default ClientRoutes;