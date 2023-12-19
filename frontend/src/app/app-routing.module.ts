import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { NbAuthComponent } from '@nebular/auth';
//import { AuthLoginComponent } from './authv2/login/auth-login.component';
//import { AuthCallbackComponent } from './authv2/callback/auth-callback.component';
//import { AuthLogoutComponent } from './authv2/logout/auth-logout.component';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./auth/login/login.module').then((m) => m.LoginModule),
  }/*,
  {
    path: 'auth',
    component: NbAuthComponent,
    children: [
      {
        path: '',
        component: AuthLoginComponent,
      },
      {
        path: 'callback',
        component: AuthCallbackComponent,
      },
      {
        path: 'logout',
        component: AuthLogoutComponent,
      },
    ],
  }*/,
  {
    path: 'pages',
    loadChildren: () => import('./pages/pages.module').then((m) => m.PagesModule),
  },
  { path: '', redirectTo: 'pages', pathMatch: 'full' },
  { path: '**', redirectTo: 'pages' },
];

const config: ExtraOptions = {
  useHash: false,
  enableTracing: false,
};

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
