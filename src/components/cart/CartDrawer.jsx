import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, MinusIcon, PlusIcon, ShoppingBagIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useCartStore } from "../../stores/cartStore";

export default function CartDrawer({ isOpen, onClose }) {
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems } =
    useCartStore();

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-gradient-to-b from-white to-gray-50 shadow-2xl">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <ShoppingBagIcon className="h-6 w-6 text-background" />
                          <Dialog.Title className="text-xl font-bold text-background">
                            Cart ({getTotalItems()})
                          </Dialog.Title>
                        </div>
                        <button
                          type="button"
                          className="rounded-full p-2 text-white/80 hover:text-background hover:bg-white/10 transition-colors"
                          onClick={onClose}
                        >
                          <XMarkIcon className="h-6 w-6" />
                        </button>
                      </div>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto px-6 py-4">

                      <div className="mt-8">
                        <div className="flow-root">
                          <ul className="-my-6 divide-y divide-gray-200">
                            {items.map((item) => (
                              <li key={item.id} className="flex py-6">
                                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md border border-border">
                                  <img
                                    src={
                                      item.product.images[0] ||
                                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxMkwxMiAxOEgxOFYxOEgxOEwxMiAxMloiIGZpbGw9IiM5Q0E0QUYiLz4KPHBhdGggZD0iTTEyIDEySDE4VjE4SDE4TDEyIDEyeiIgZmlsbD0iIzlDQTNBMiIvPgo8dGV4dCB4PSIxMiIgeT0iMTUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI2IiBmaWxsPSIjNjM2NkYxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+"
                                    }
                                    alt={item.product.name}
                                    className="h-full w-full object-cover object-center"
                                  />
                                </div>

                                <div className="ml-4 flex flex-1 flex-col">
                                  <div>
                                    <div className="flex justify-between text-base font-medium text-foreground">
                                      <h3 className="line-clamp-2">
                                        {item.product.name}
                                      </h3>
                                      <p className="ml-4">
                                        ৳
                                        {item.product.discount_price ||
                                          item.product.price}
                                      </p>
                                    </div>
                                    <p className="mt-1 text-sm text-background0">
                                      {item.product.brand}
                                    </p>
                                  </div>
                                  <div className="flex flex-1 items-end justify-between text-sm">
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() =>
                                          updateQuantity(
                                            item.id,
                                            item.quantity - 1
                                          )
                                        }
                                        className="p-1 rounded-md hover:bg-muted"
                                      >
                                        <MinusIcon className="w-4 h-4" />
                                      </button>
                                      <span className="px-2 py-1 border rounded">
                                        {item.quantity}
                                      </span>
                                      <button
                                        onClick={() =>
                                          updateQuantity(
                                            item.id,
                                            item.quantity + 1
                                          )
                                        }
                                        className="p-1 rounded-md hover:bg-muted"
                                      >
                                        <PlusIcon className="w-4 h-4" />
                                      </button>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => removeItem(item.id)}
                                      className="font-medium text-red-600 hover:text-red-500"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border px-4 py-6 sm:px-6">
                      <div className="flex justify-between text-base font-medium text-foreground">
                        <p>Subtotal</p>
                        <p>৳{getTotalPrice()}</p>
                      </div>
                      <p className="mt-0.5 text-sm text-background0">
                        Shipping calculated at checkout.
                      </p>
                        <div className="space-y-3">
                          <Link
                            to="/checkout"
                            onClick={onClose}
                            className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-background px-6 py-4 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                          >
                            <ShoppingBagIcon className="w-5 h-5" />
                            Proceed to Checkout
                          </Link>
                          
                          <button
                            onClick={onClose}
                            className="w-full text-emerald-600 hover:text-emerald-700 font-medium py-2 transition-colors"
                          >
                            Continue Shopping
                          </button>
                        </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
