---
trigger: always_on
---

# API and Hooks Architecture Summary

Based on a review of the `src/services`, `src/hooks`, `src/const`, and `src/config` directories, here is a breakdown of the app's data-fetching architecture:

## Network Configuration (`src/services/api/httpRequest.ts`)
- The app uses `axios` for making HTTP requests.
- An instance `axiosInstance` is configured with a base URL from `serverDetails.serverProxyURL`.
- **Request Interceptor:** Automatically attaches the authentication token (retrieved via `getAuthToken()`) to every request header.
- **Response Interceptor:** Handles global error scenarios. For instance, a `401 Unauthorized` response triggers a toast notification, clears auth data, and resets navigation to the `Login` screen.

## React Query Configuration (`src/config/reactQuery.ts`)
- The app utilizes `@tanstack/react-query` to manage server state.
- **Default Query Settings:**
  - `staleTime`: 5 minutes
  - `gcTime`: 10 minutes
  - `retry`: 3 times with exponential backoff
  - `refetchOnWindowFocus`: disabled
  - `refetchOnReconnect` & `refetchOnMount`: enabled
- **Default Mutation Settings:**
  - Retries failed mutations once with a 1-second delay.

## API Services (`src/services/api/`)
The application is structured into domain-specific modules encapsulating the endpoints:
- `auth.ts`
- `cart.ts`
- `company.ts`
- `contact.ts`
- `file.ts` (handles multipart/form-data for file uploads)
- `invoice.ts`
- `orders.ts`
- `payment.ts`
- `product.ts`
- `recentProduct.ts`
- `settings.ts`
- `user.ts`

## Custom Hooks (`src/hooks/`)
To interface components with React Query and API services cleanly, the project utilizes custom hooks matching the service domains. These hooks typically expose `useQuery` (for GET requests) and `useMutation` (for POST/PUT/DELETE requests).

**Implemented Hooks:**
- `useAuth.ts`: Exposes `useLogin`, `useLogout`, `useOTPVerification`, `useResendOTP`.
- `useCart.ts`
- `useContact.ts`
- `useFileUpload.ts`
- `useInvoice.ts`
- `useOrder.ts`
- `usePayment.ts`
- `useProduct.ts`: Uses `useInfiniteQuery` for paginated product fetching and `useQuery` for specific product details.
- `useRecentProduct.ts`
- `useSettings.ts`
- 

## Constants (`src/const/`)
The constant variables, typographies/fonts (`fonts.ts`), and static keys (`keys.ts`) used across the application are stored here, streamlining UI elements and magic strings.

---

> [!NOTE]
 The axios imports in these API files were also corrected to use the project's intercepted `httpRequest`.
all project ina used now a this taip code formet now a used now a 
