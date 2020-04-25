import { call, select, put, all, takeLatest } from 'redux-saga/effects';
import { css } from 'glamor';
import { toast } from 'react-toastify';

import api from '../../../services/api';
import history from '../../../services/history';
import { formatPrice } from '../../../util/format';

import { addToCartSuccess, updateAmountSuccess } from './actions';

function* addToCart({ id }) {
  const productExists = yield select((state) =>
    state.cart.find((product) => product.id === id)
  );

  const stock = yield call(api.get, `/stock/${id}`);

  const stockAmount = stock.data.amount;
  const currentAmount = productExists ? productExists.amount : 0;

  const amount = currentAmount + 1;

  if (amount > stockAmount) {
    toast.error('Quantidade solicitada fora de estoque', {
      className: css({
        background: 'transparent',
        border: '1px solid #bdabab',
        borderRadius: '5px',
        color: '#6e6e6e',
      }),
      bodyClassName: css({
        fontSize: '14px',
      }),
      progressClassName: css({
        background: 'linear-gradient(to right, #f76a8c, #ddd6f3)',
      }),
      closeButton: false,
    });
    return;
  }

  if (productExists) {
    yield put(updateAmountSuccess(id, amount));
  } else {
    const response = yield call(api.get, `/products/${id}`);

    const data = {
      ...response.data,
      amount: 1,
      priceFormatted: formatPrice(response.data.price),
    };

    yield put(addToCartSuccess(data));

    history.push('/cart');
  }
}

function* updateAmount({ id, amount }) {
  if (amount <= 0) return;

  const stock = yield call(api.get, `stock/${id}`);
  const stockAmount = stock.data.amount;

  if (amount > stockAmount) {
    toast.error('Quantidade solicitada fora de estoque', {
      className: css({
        background: 'transparent',
        border: '1px solid #bdabab',
        borderRadius: '5px',
        color: '#6e6e6e',
      }),
      bodyClassName: css({
        fontSize: '14px',
      }),
      progressClassName: css({
        background: 'linear-gradient(to right, #f76a8c, #ddd6f3)',
      }),
      closeButton: false,
    });
    return;
  }

  yield put(updateAmountSuccess(id, amount));
}

export default all([
  takeLatest('@cart/ADD_REQUEST', addToCart),
  takeLatest('@cart/UPDATE_AMOUNT_REQUEST', updateAmount),
]);
