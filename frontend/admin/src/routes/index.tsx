import LayoutDefault from "@/components/layout/LayoutDefault";
import PrivateRoute from "@/components/PrivateRoute";
import ProtectedRoute from "@/components/ProtectedRoute";
import { DashboardOverview } from "@/pages/Dashboard/Overview";
import { Login } from "@/pages/Login/Login";
import { Profile } from "@/pages/Profile/StaffProfile";
import { PermissionList } from "@/pages/Permissions";
import { RoleList } from "@/pages/Roles";
import { MovieList } from "@/pages/Movies";
import { ShowtimeList } from "@/pages/Showtimes";
import { TheaterList } from "@/pages/Theaters";
import { TicketList } from "@/pages/Tickets";
import { CustomerList } from "@/pages/Customers";
import { StaffList } from "@/pages/Staff";
import { BookingList } from "@/pages/Bookings";
import { ComboList } from "@/pages/Combos";
import { InvoiceList } from "@/pages/Invoices";
import { ReportList } from "@/pages/Reports";
import { Forbidden } from "@/pages/Forbidden";
import { NotFound } from "@/pages/NotFound";
import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import { Navigate } from "react-router-dom";
import { TicketBookingPage } from "@/pages/TicketBooking/TickKetBookingPage";

export const routes = [
  {
    path: ROUTES.LOGIN,
    element: <Login />,
  },
  {
    path: `${ROUTES.FORBIDDEN}`,
    element: <Forbidden />,
  },
  {
    path: ROUTES.HOME,
    element: <PrivateRoute />,
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.DASHBOARD} replace />,
      },
      {
        element: <LayoutDefault />,
        children: [
          {
            path: `${ROUTES.DASHBOARD}`,
            element: <DashboardOverview />,
          },
          {
            path: `${ROUTES.SETTINGS_PROFILE}`,
            element: <Profile />,
          },
          {
            path: `${ROUTES.MOVIES}`,
            element: (
              <ProtectedRoute requiredPermissions={[PERMISSIONS.MOVIE_READ]} />
            ),
            children: [
              {
                index: true,
                element: <MovieList />,
              },
            ],
          },
          {
            path: `${ROUTES.SHOWTIMES}`,
            element: (
              <ProtectedRoute
                requiredPermissions={[PERMISSIONS.SHOWTIME_READ]}
              />
            ),
            children: [
              {
                index: true,
                element: <ShowtimeList />,
              },
            ],
          },
          {
            path: `${ROUTES.THEATERS}`,
            element: (
              <ProtectedRoute
                requiredPermissions={[PERMISSIONS.THEATER_READ]}
              />
            ),
            children: [
              {
                index: true,
                element: <TheaterList />,
              },
            ],
          },
          {
            path: `${ROUTES.TICKETS}`,
            element: (
              <ProtectedRoute requiredPermissions={[PERMISSIONS.TICKET_READ]} />
            ),
            children: [
              {
                index: true,
                element: <TicketList />,
              },
            ],
          },
          {
            path: `${ROUTES.ROLES}`,
            element: (
              <ProtectedRoute requiredPermissions={[PERMISSIONS.ROLE_READ]} />
            ),
            children: [
              {
                index: true,
                element: <RoleList />,
              },
            ],
          },
          {
            path: `${ROUTES.PERMISSIONS}`,
            element: (
              <ProtectedRoute
                requiredPermissions={[PERMISSIONS.PERMISSION_READ]}
              />
            ),
            children: [
              {
                index: true,
                element: <PermissionList />,
              },
            ],
          },
          {
            path: `${ROUTES.CUSTOMERS}`,
            element: (
              <ProtectedRoute
                requiredPermissions={[PERMISSIONS.CUSTOMER_READ]}
              />
            ),
            children: [
              {
                index: true,
                element: <CustomerList />,
              },
            ],
          },
          {
            path: `${ROUTES.STAFF}`,
            element: (
              <ProtectedRoute requiredPermissions={[PERMISSIONS.STAFF_READ]} />
            ),
            children: [
              {
                index: true,
                element: <StaffList />,
              },
            ],
          },
          {
            path: `${ROUTES.BOOKINGS}`,
            element: (
              <ProtectedRoute
                requiredPermissions={[PERMISSIONS.BOOKING_READ]}
              />
            ),
            children: [
              {
                index: true,
                element: <BookingList />,
              },
            ],
          },
          {
            path: `${ROUTES.COMBOS}`,
            element: (
              <ProtectedRoute requiredPermissions={[PERMISSIONS.COMBO_READ]} />
            ),
            children: [
              {
                index: true,
                element: <ComboList />,
              },
            ],
          },
          {
            path: `${ROUTES.INVOICES}`,
            element: (
              <ProtectedRoute
                requiredPermissions={[PERMISSIONS.INVOICE_READ]}
              />
            ),
            children: [
              {
                index: true,
                element: <InvoiceList />,
              },
            ],
          },
          {
            path: `${ROUTES.REPORTS}`,
            element: (
              <ProtectedRoute requiredPermissions={[PERMISSIONS.REPORT_READ]} />
            ),
            children: [
              {
                index: true,
                element: <ReportList />,
              },
            ],
          },
          {
            path: `${ROUTES.TICKET_BOOKING}`,
            element: (
              <ProtectedRoute
                requiredPermissions={[PERMISSIONS.TICKET_BOOKING_READ]}
              />
            ),
            children: [
              {
                index: true,
                element: <TicketBookingPage />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

// Re-export ROUTES from constants for backward compatibility
export { ROUTES };
