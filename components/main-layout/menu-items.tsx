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
  RiBookLine,
  RiGraduationCapLine,
  RiCommunityLine,
  RiTranslate,
  RiUserStarLine,
  RiShieldUserLine,
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
          url: "/programs",
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
          url: "/programs",
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
        {
          title: "Faculties",
          url: "/faculties",
          icon: RiBookLine,
          isActive: false,
        },
        {
          title: "Specialities",
          url: "/specialities",
          icon: RiGraduationCapLine,
          isActive: false,
        },
        {
          title: "Cities",
          url: "/cities",
          icon: RiCommunityLine,
          isActive: false,
        },

        {
          title: "Degrees",
          url: "/degrees",
          icon: RiGraduationCapLine,
          isActive: false,
        },

        {
          title: "Languages",
          url: "/languages",
          icon: RiTranslate,
          isActive: false,
        },
      ],
    },

    {
      title: "Admin Area",
      url: "#",
      items: [
        {
          title: "Settings",
          url: "/settings",
          icon: RiSettings3Line,
        },
        {
          title: "Users",
          url: "/users",
          icon: RiTeamLine,
          isActive: false,
          resource: "users",
        },
        {
          title: "Roles",
          url: "/roles",
          icon: RiUserStarLine,
          isActive: false,
          resource: "roles",
        },
        {
          title: "Permissions",
          url: "/permissions",
          icon: RiShieldUserLine,
          isActive: false,
          resource: "permissions",
        },
      ],
    },
  ];

  const agencyNavMain = [
    ...navMain,

    {
      title: "Admin Area",
      url: "#",
      items: [
        {
          title: "Settings",
          url: "/settings",
          icon: RiSettings3Line,
        },
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
  const isAgency =
    user.roles === UserRoles.AGENT || user.roles?.includes(UserRoles.AGENT);

  return {
    navMain: isAdmin ? adminNavMain : isAgency ? agencyNavMain : navMain,
  };
};
