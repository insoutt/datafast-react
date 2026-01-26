type DatafastProps = {
  text?: string;
};

export const Datafast = ({ text = 'hello2' }: DatafastProps) => {
  return <span>{text}</span>;
};
