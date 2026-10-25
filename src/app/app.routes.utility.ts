import { Routes } from "@angular/router";
import { Paths } from "@app/data/menu-data";
import { Icons } from "@app/shared/constants/icon.constants";

export const utilityRoutes: Routes = [
    {
        path: Paths.Error.url,
        loadComponent: () => import('@shared/error/error'),
        data: {
            showBar: false,
            breadcrumb: Paths.Error.title,
            breadcrumbIcon: Icons.AutoStories
        },
        title: Paths.Error.title
    },
]
