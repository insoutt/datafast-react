**@insoutt/datafast-react**

`@insoutt/datafast-react` es una librería de React que permite integrar [Datafast](https://datafast.com.ec) y facilita la interacción con el flujo de pago. Permite implementar una interfaz personalizada y robusta sobre el widget de Datafast de manera rápida.

## Componentes

### Datafast

Renderiza el formulario de pago de Datafast y carga el script remoto. Soporta modo redirection e inline (iframe de respuesta) y permite personalizar textos y comportamiento del widget.

#### Props

| Prop               | Tipo                        | Requerido | Default                                 | Descripción                                                           |
| ------------------ | --------------------------- | --------- | --------------------------------------- | --------------------------------------------------------------------- |
| `checkoutId`        | `string`                    | Sí        | —                                       | ID de pago generado en el backend.                             |
| `callbackUrl`      | `string`                    | Sí        | —                                       | URL de retorno del pago. En modo `inline` se carga dentro del iframe. |
| `title`            | `string`                    | No        | `Información de pago`                   | Título del encabezado.                                                |
| `description`      | `string`                    | No        | `Ingresa los datos de tu tarjeta`       | Texto descriptivo del encabezado.                                     |
| `rememberCard`     | `boolean`                   | No        | `false`                                 | Muestra el checkbox para recordar tarjeta.                            |
| `rememberCardText` | `string`                    | No        | `Recordar tarjeta para futuras compras` | Etiqueta del checkbox de recordar tarjeta.                            |
| `amount`           | `number`                    | No        | `0`                                     | Muestra el resumen “Total a pagar” cuando es mayor a 0.               |
| `onReady`          | `() => void`                | No        | —                                       | Callback cuando el widget está listo.                                 |
| `onError`          | `(error: any) => void`      | No        | —                                       | Callback ante error del widget.                                       |
| `type`             | `'redirection' \| 'inline'` | No        | `redirection`                           | Modo de respuesta del pago. `inline` muestra un iframe.               |
| `availableBrands`  | `string[]`                  | No        | `['VISA','MASTER','AMEX']`              | Marcas de tarjeta disponibles para el widget.                         |
| `config`           | `Omit<WpwlOptions,'style'>` | No        | —                                       | Opciones avanzadas de WPWL (labels, callbacks, etc).                  |
| `isTest`       | `boolean`                                                                  | No        | `true`              | Usa el script de entorno de pruebas.              |

#### Ejemplo mínimo

```tsx
import { Datafast } from '@insoutt/datafast-react';

<Datafast
  checkoutId={checkoutId}
  callbackUrl="https://mi-sitio.com/pago/resultado"
  amount={19.99}
  availableBrands={['VISA', 'MASTER']}
/>;
```

### PaymentButton

Botón que crea el checkout y devuelve `checkoutId` para renderizar el widget de Datafast. Permite render-prop para personalizar el UI.

#### Props

| Prop           | Tipo                                                                       | Requerido | Default             | Descripción                                       |
| -------------- | -------------------------------------------------------------------------- | --------- | ------------------- | ------------------------------------------------- |
| `url`          | `string`                                                                   | Sí        | —                   | Endpoint backend que crea el checkout.            |
| `checkoutData` | `CheckoutData`                                                             | Sí        | —                   | Datos del cliente y carrito enviados al backend.  |
| `onSuccess`    | `(data: { checkoutId: string; }) => void`                | Sí        | —                   | Se ejecuta cuando el backend retorna el checkout. |
| `onError`      | `(error: Error) => void`                                                   | Sí        | —                   | Se ejecuta cuando falla la creación del checkout. |
| `text`         | `string`                                                                   | No        | `Pagar con tarjeta` | Texto del botón por defecto.                      |
| `variant`      | `'primary' \| 'dark'`                                                      | No        | `primary`           | Estilo visual del botón.                          |
| `children`     | `(props: { isLoading: boolean; createCheckout: () => void }) => ReactNode` | No        | —                   | Render-prop para UI personalizado.                |

`CheckoutData` incluye `customer` (datos del cliente) y `cart.items` (items del carrito).

Para que `PaymentButton` funcione correctamente, el backend debe responder un JSON usando la siguiente estructura:

```json
{
  "data": {
    "id": "79E1E1EBB41134A257CB8D22280D6BBC.uat01-vm-tx01" // id generado en el backend
  }
}
```

#### Uso

```tsx
import { useState } from 'react';
import { PaymentButton, Datafast } from '@insoutt/datafast-react';

function CheckoutExample() {
  const [checkoutId, setCheckoutId] = useState<string | null>(null);

  return (
    <>
      <PaymentButton
        url="https://mi-backend.com/checkout"
        checkoutData={{
          customer: {
            givenName: 'Juan',
            surname: 'Pérez',
            email: 'juan@mail.com',
            phone: '0999999999',
            identificationDocId: '0102030405',
          },
          cart: {
            items: [
              {
                name: 'Producto A',
                description: 'Descripción',
                val_base0: 0,
                val_baseimp: 19.99,
                val_iva: 2.4,
                quantity: 1,
              },
            ],
          },
        }}
        onSuccess={({ checkoutId }) => setCheckoutId(checkoutId)}
        onError={(error) => console.error(error)}
      />

      {checkoutId && (
        <Datafast
          checkoutId={checkoutId}
          callbackUrl="https://mi-sitio.com/pago/resultado"
        />
      )}
    </>
  );
}
```

#### Ejemplo botón de pagos personalizado

```tsx
import { PaymentButton } from '@insoutt/datafast-react';

<PaymentButton
  url="https://mi-backend.com/checkout"
  checkoutData={checkoutData}
  onSuccess={({ checkoutId }) => console.log('checkoutId', checkoutId)}
  onError={(error) => console.error(error)}
>
  {({ isLoading, createCheckout }) => (
    <button
      onClick={createCheckout}
      disabled={isLoading}
      className="mi-boton-personalizado"
    >
      {isLoading ? 'Procesando...' : 'Pagar ahora'}
    </button>
  )}
</PaymentButton>
```

## Contact

- 𝕏 (Twitter): [@insoutt](http://x.com/insoutt)
- Sitio Web: [elvisfernando.com](https://elvisfernando.com)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
