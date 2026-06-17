export interface TableHeaderProps {
  filterDropDow: string[];
  tableHeading: string;
  buttonData: {
    icon: React.ElementType;
    text: string;
    variant: "text" | "outlined" | "contained";
    color:
      | "inherit"
      | "primary"
      | "secondary"
      | "success"
      | "error"
      | "info"
      | "warning";
    link?: string;
    onClick?: () => void;
    component?: React.ElementType;
    disabled?: boolean;
    children?: React.ReactNode;
  }[];
}
