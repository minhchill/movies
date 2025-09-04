import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { textColor } from "../../styles";
import { cn } from "../../utils/helper";
import { selectWatchedItems } from "@/features/watchedList/slice/watchedListSlice";

interface HeaderProps {
  link: { title: string; path: string };
  isNotFoundPage: boolean;
  showBg: boolean;
}

const HeaderNavItem = ({ link, showBg, isNotFoundPage }: HeaderProps) => {
  const watchedItems = useSelector(selectWatchedItems);
  const isWatchedLink = link.path === "/watched";
  const watchedCount = watchedItems.length;

  return (
    <li>
      <NavLink
        to={link.path}
        className={({ isActive }) => {
          return cn(
            "nav-link relative",
            isActive
              ? ` active ${showBg ? textColor : `text-secColor`}`
              : ` ${
                  isNotFoundPage || showBg
                    ? "text-[#444] dark:text-gray-300 dark:hover:text-secColor hover:text-black"
                    : "text-gray-300 hover:text-secColor"
                }`
          );
        }}
        end
      >
        {link.title}
        {isWatchedLink && watchedCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {watchedCount > 99 ? '99+' : watchedCount}
          </span>
        )}
      </NavLink>
    </li>
  );
};

export default HeaderNavItem;
