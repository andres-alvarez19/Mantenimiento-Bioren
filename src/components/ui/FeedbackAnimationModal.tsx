
import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Button from './Button';

interface FeedbackAnimationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error';
  title: string;
  message: string;
}

const animationStyles = `
  .checkmark__circle, .cross__circle {
    stroke-dasharray: 166;
    stroke-dashoffset: 166;
    stroke-width: 2;
    stroke-miterlimit: 10;
    fill: none;
    animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
  }
  .checkmark__check {
    transform-origin: 50% 50%;
    stroke-dasharray: 48;
    stroke-dashoffset: 48;
    animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
  }
  .cross__line {
    transform-origin: 50% 50%;
    stroke-dasharray: 48;
    stroke-dashoffset: 48;
  }
  .cross__line--left {
    animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
  }
  .cross__line--right {
    animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 1s forwards;
  }
  @keyframes stroke {
    100% {
      stroke-dashoffset: 0;
    }
  }
`;

const SuccessIcon: React.FC = () => (
  <div className="mx-auto flex h-24 w-24 items-center justify-center">
    <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
      <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" stroke="#22c55e" />
      <path className="checkmark__check" fill="none" stroke="#22c55e" strokeWidth="3" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
    </svg>
  </div>
);

const ErrorIcon: React.FC = () => (
  <div className="mx-auto flex h-24 w-24 items-center justify-center">
    <svg className="cross" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
      <circle className="cross__circle" cx="26" cy="26" r="25" fill="none" stroke="#ef4444" />
      <path className="cross__line cross__line--left" fill="none" stroke="#ef4444" strokeWidth="3" d="M16 16 36 36" />
      <path className="cross__line cross__line--right" fill="none" stroke="#ef4444" strokeWidth="3" d="M36 16 16 36" />
    </svg>
  </div>
);


const FeedbackAnimationModal: React.FC<FeedbackAnimationModalProps> = ({ isOpen, onClose, type, title, message }) => {
  return (
    <>
      <style>{animationStyles}</style>
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                  <div>
                    {type === 'success' ? <SuccessIcon /> : <ErrorIcon />}
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900">
                        {title}
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">{message}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <Button
                      type="button"
                      variant={type === 'success' ? 'primary' : 'danger'}
                      className="w-full"
                      onClick={onClose}
                    >
                      Close
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

export default FeedbackAnimationModal;
