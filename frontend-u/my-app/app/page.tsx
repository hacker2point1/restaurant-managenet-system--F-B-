import RestaurantHero from "@/src/components/home/restaturentHero";
import MenuCategoriesSection from "@/src/components/menu-categories/MenuCategoriesSection";
import FeaturedRestaurants from "@/src/components/restaurants/FeaturedRestaurants";
import WeekendOffer from "@/src/components/home/WeekendOffer";
import WhyChooseUs from "@/src/components/home/WhyChooseUs";

export default function Home() {
    return (
        <>
            <RestaurantHero />
            <MenuCategoriesSection />
            <FeaturedRestaurants/>
            <WeekendOffer />
            <WhyChooseUs />
        </>
    );
}
