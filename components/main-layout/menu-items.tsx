import { UserRoles } from "@/types/types";
import {
  RiScanLine,
  RiMessage2Line,
  RiSettings3Line,
  RiTeamLine,
  RiFileListLine,
  RiUserLine,
  RiBuildingLine,
  RiMapLine,
  RiCalendarLine,
  RiCalendar2Line,
  RiNotification3Line,
} from "@remixicon/react";
import { SearchIcon } from "lucide-react";

export const getNavData = (user: { roles?: string }) => {
  const navMain = [
    {
      title: "Sections",
      url: "#",
      items: [
        {
          title: "Dashboard",
          url: "/",
          icon: RiScanLine,
          isActive: false,
        },
        {
          title: "Search Programs",
          url: "/search-programs",
          icon: SearchIcon,
          isActive: false,
        },
        {
          title: "Applications",
          url: "/applications",
          icon: RiFileListLine,
          isActive: false,
        },
        {
          title: "Students",
          url: "/students",
          icon: RiUserLine,
          isActive: false,
        },
        {
          title: "Announcements",
          url: "/announcements",
          icon: RiNotification3Line,
          isActive: false,
        },
      ],
    },
  ];

  const adminNavMain = [
    {
      title: "Sections",
      url: "#",
      items: [
        {
          title: "Dashboard",
          url: "/",
          icon: RiScanLine,
          isActive: false,
        },
        {
          title: "Search Programs",
          url: "/search-programs",
          icon: SearchIcon,
          isActive: false,
        },
        {
          title: "Applications",
          url: "/applications",
          icon: RiFileListLine,
          isActive: false,
        },
        {
          title: "Students",
          url: "/students",
          icon: RiUserLine,
          isActive: false,
        },
        {
          title: "Announcements",
          url: "/announcements",
          icon: RiNotification3Line,
          isActive: false,
        },
        {
          title: "Universities",
          url: "/universities",
          icon: RiBuildingLine,
          isActive: false,
        },
        {
          title: "Countries",
          url: "/countries",
          icon: RiMapLine,
          isActive: false,
        },
        {
          title: "Semesters",
          url: "/semesters",
          icon: RiCalendarLine,
          isActive: false,
        },
        {
          title: "Academic Years",
          url: "/academic-years",
          icon: RiCalendar2Line,
          isActive: false,
        },
      ],
    },
    {
      title: "Other",
      url: "#",
      items: [
        {
          title: "Settings",
          url: "/settings",
          icon: RiSettings3Line,
        },
      ],
    },
    {
      title: "Admin Area",
      url: "#",
      items: [
        {
          title: "Users",
          url: "/users",
          icon: RiTeamLine,
          isActive: false,
          resource: "users",
        },
      ],
    },
  ];

  const isAdmin =
    user.roles === UserRoles.ADMIN || user.roles?.includes(UserRoles.ADMIN);

  return {
    navMain: isAdmin ? adminNavMain : navMain,
  };
};
