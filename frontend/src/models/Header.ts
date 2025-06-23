export type HeaderProps = {
    channel: string;
    setChannel: (channel: string) => void;
    onConnect: (channel: string) => void;
}