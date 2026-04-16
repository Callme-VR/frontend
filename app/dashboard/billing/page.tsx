"use client";
import type { VariantProps } from "class-variance-authority";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";

interface PricingPlan {
  title: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: VariantProps<typeof buttonVariants>["variant"];
  isPopular?: boolean;
  savePercentage?: string;
  priceId: string;
}

const plans: PricingPlan[] = [
  {
    title: "Small Pack",
    price: "$1.00",
    description: "Perfect for occasional podcast creators",
    features: ["10 credits", "No expiration", "Download all clips"],
    buttonText: "Buy 10 credits",
    buttonVariant: "outline",
    priceId: "5d518c29-8804-4bca-9b13-2a275c245c73",
  },
  {
    title: "Medium Pack",
    price: "$5.00",
    description: "Best value for regular podcasters",
    features: ["50 credits", "No expiration", "Download all clips"],
    buttonText: "Buy 50 credits",
    buttonVariant: "default",
    isPopular: true,
    savePercentage: "Save 17%",
    priceId: "3deb32fd-578f-4cc3-8594-3850f92f61b8",
  },
  {
    title: "Large Pack",
    price: "$15.00",
    description: "Ideal for podcast studios and agencies",
    features: ["100 credits", "No expiration", "Download all clips"],
    buttonText: "Buy 100 credits",
    buttonVariant: "outline",
    isPopular: false,
    savePercentage: "Save 30%",
    priceId: "37433757-1f3b-490c-afb9-32c12e2f86f4",
  },
];

function PricingCard({ plan }: { plan: PricingPlan }) {
  const { data: session } = useSession();
  
  const handleCheckout = () => {
    const params = new URLSearchParams({ 
      products: plan.priceId,
    });
    if (session?.user?.email) {
      params.set("customerEmail", session.user.email);
    }
    window.location.href = `/api/checkout?${params.toString()}`;
  };

  return (
    <Card
      className={cn(
        "relative flex flex-col transition-all duration-200 hover:shadow-lg",
        plan.isPopular && "border-2 border-black dark:border-white shadow-lg pt-8",
        "border-zinc-200 dark:border-zinc-800"
      )}
    >
      {plan.isPopular && (
        <div className="bg-black text-white dark:bg-white dark:text-black absolute top-0 left-1/2 -translate-x-1/2 transform rounded-full px-4 py-1.5 text-xs font-medium tracking-wide whitespace-nowrap z-10 shadow-md">
          Most Popular
        </div>
      )}
      <CardHeader className="flex-1 pb-6">
        <CardTitle className="text-xl font-medium tracking-tight">{plan.title}</CardTitle>
        <div className="mt-3">
          <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
        </div>
        {plan.savePercentage && (
          <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-2">
            {plan.savePercentage}
          </p>
        )}
        <CardDescription className="mt-4 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          {plan.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pb-6">
        <ul className="text-zinc-600 dark:text-zinc-400 space-y-4 text-sm">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className={cn(
                "size-5 mt-0.5 shrink-0",
                plan.isPopular 
                  ? "text-black dark:text-white" 
                  : "text-zinc-500 dark:text-zinc-400"
              )} />
              <span className="leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          variant={plan.buttonVariant} 
          className={cn(
            "w-full transition-all duration-200",
            plan.isPopular 
              ? "bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black" 
              : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )} 
          onClick={handleCheckout}
        >
          {plan.buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="relative text-center mb-16">
          <Button
            className="absolute -top-2 left-0"
            variant="ghost"
            size="icon"
            asChild
          >
            <Link href="/dashboard" aria-label="Back to dashboard">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="max-w-2xl mx-auto space-y-4">
            <h1 className="text-3xl font-light tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              Buy Credits
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed max-w-lg mx-auto">
              Purchase credits to generate more podcast clips. The more credits you buy, the better the value.
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 gap-8 mb-16 lg:grid-cols-3 xl:gap-10">
          {plans.map((plan) => (
            <PricingCard key={plan.title} plan={plan} />
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-8 border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-6">
            How credits work
          </h3>
          <ul className="text-zinc-600 dark:text-zinc-400 space-y-3 text-sm leading-relaxed">
            <li className="flex items-start gap-3">
              <span className="text-zinc-400 dark:text-zinc-500 mt-0.5">•</span>
              <span>1 credit = 1 minute of podcast processing</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-zinc-400 dark:text-zinc-500 mt-0.5">•</span>
              <span>The program will create around 1 clip per 5 minutes of podcast</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-zinc-400 dark:text-zinc-500 mt-0.5">•</span>
              <span>Credits never expire and can be used anytime</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-zinc-400 dark:text-zinc-500 mt-0.5">•</span>
              <span>Longer podcasts require more credits based on duration</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-zinc-400 dark:text-zinc-500 mt-0.5">•</span>
              <span>All packages are one-time purchases (not subscription)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
