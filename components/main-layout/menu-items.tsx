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

  const agencyNavMain = [
    ...navMain,
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
  const isAgency =
    user.roles === UserRoles.AGENCY || user.roles?.includes(UserRoles.AGENCY);

  return {
    navMain: isAdmin ? adminNavMain : isAgency ? agencyNavMain : navMain,
  };
};
