"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setInitialCartItems } from "@/lib/store/features/cart/cartSlice";
import { ShoppingBasket } from "lucide-react";
import Link from "next/link";

const CartCounter = () => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.cartItems);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cartItems") || "[]");

    dispatch(setInitialCartItems(storedCart));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, [dispatch]);

  if (!mounted) return null; // 🚀 prevents hydration mismatch

  return (
    <div className="relative">
      <Link href="/cart">
        <ShoppingBasket className="hover:text-primary" />
      </Link>
      <span className="absolute -top-4 -right-5 h-6 w-6 flex items-center justify-center rounded-full bg-primary font-bold text-white">
        {cartItems.length}
      </span>
    </div>
  );
};

export default CartCounter;
