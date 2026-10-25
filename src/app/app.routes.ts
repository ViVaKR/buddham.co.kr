import { Routes } from '@angular/router';
import { authRoutes } from '@app/app.routes.auth';
import { buddhaRoutes } from '@app/app.routes.buddha';
import { utilityRoutes } from '@app/app.routes.utility';
import { Paths } from '@app/data/menu-data';

export const routes: Routes = [
    { path: '', redirectTo: Paths.Home.url, pathMatch: 'full' },
    {
        path: Paths.Home.url,
        loadChildren: () => import('@pages/home/home.routes'),
    },
    ...authRoutes,
    ...utilityRoutes,
    ...buddhaRoutes,
    { path: '**', redirectTo: Paths.Home.url }
];