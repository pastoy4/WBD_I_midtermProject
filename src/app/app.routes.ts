import { Routes } from '@angular/router';
import { Registration } from './registration/registration';
import { Login } from './login/login';
import { Home } from './home/home';
import { Users } from './users/users';

export const routes: Routes = [
    {
        path: 'login',
        component: Login
    },

    // 2. Top-level route for Registration
    {
        path: 'registration',
        component: Registration,
        // REMOVE THIS LINE: redirectTo: '/login' 
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
                // Add your default 'home' route here
                {
                    path: '',
                    redirectTo: 'users', // <-- Add this
                    pathMatch: 'full'
                }
            ]
    },

    // 5. (Optional) Wildcard route for 404 pages
    {
        path: '**',
        redirectTo: '/login' // Or a custom 404 component
    }

];