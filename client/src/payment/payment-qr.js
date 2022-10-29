import PaymentMethods from "../bll/paymentMethods";

export const getPaymentQrForOrder = (order) => {
    if (order.paymentMethod === 'wecom-pay') {
        const fileName = `${(order.finalCents / 100).toFixed(2)}.PNG`
        return `/images/wecom-pay-qrs/${fileName}`
    } else {
        return (PaymentMethods[order.paymentMethod] && PaymentMethods[order.paymentMethod].receiverImage) || PaymentMethods["wecom-pay"].receiverImage
    }
}