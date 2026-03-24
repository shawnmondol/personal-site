import {PopupModal} from "../SiteComponents/PopupModal.tsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {useEffect, useState} from "react";

interface TravelGalleryProps {
    images: string[];
    isOpen: boolean;
    onClose: () => void;
}

export function TravelGalleryModal({images, isOpen, onClose}: TravelGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    function next() { setCurrentIndex( i => (i + 1) % images.length) }
    function prev() { setCurrentIndex(i => (i - 1 + images.length) % images.length) }

    useEffect(() => {
        if (isOpen) setCurrentIndex(0)
    }, [isOpen])

    return (
        <PopupModal
        isOpen={isOpen}
        onClose={onClose}
        className="overflow-hidden! p-0! bg:-gray-100!"
        >
            <div className="w-full h-full relative">
                <div className={"absolute left-0 top-0 flex items-center cursor-pointer transition-colors h-full p-4 hover:bg-gray-100"}
                    onClick={() => {prev()}}>
                    <ChevronLeft />
                </div>
                <div className={"w-full h-full"}>
                    <img src={images[currentIndex]}  alt={""} className="w-full max-h-[60vh] object-contain" />
                </div>
                <div className={"absolute right-0 top-0 flex items-center cursor-pointer transition-colors h-full p-4 hover:bg-gray-100"}
                    onClick={() => {next()}}>
                    <ChevronRight />
                </div>
                <p
                    className={"absolute right-0 bottom-1 -translate-1/2"}
                >
                    {currentIndex + 1} / {images.length}</p>
            </div>
        </PopupModal>
    )
}