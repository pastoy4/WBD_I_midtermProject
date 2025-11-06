import { Routes } from '@angular/router';
import { Registration } from './registration/registration';
import { Login } from './login/login';
import { Home } from './home/home';
import { Users } from './users/users';
import { Categories } from './categories/categories';

export const routes: Routes = [
    {
        path: 'login',
        component: Login
    },

    {
        path: 'registration',
        component: Registration,
    },
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    {
        path: 'home',
        component: Home,
        children:
            [
                {
                    path: 'users',
                    component: Users
                },
                {
                    path: 'categories',
                    component: Categories
                },
                {
                    path: '',
                    redirectTo: 'users',
                    pathMatch: 'full'
                }
            ]
    },
    {
        path: '**',
        redirectTo: '/login'
    }

];