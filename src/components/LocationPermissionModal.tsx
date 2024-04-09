import React, {useEffect, useState} from 'react';
import {RESULTS} from 'react-native-permissions';
import type {PermissionStatus} from 'react-native-permissions';
import LocationMarker from '@assets/images/receipt-location-marker.svg';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLocationPermissionStatus, requestLocationPermission} from '@pages/iou/request/step/IOURequestStepScan/LocationPermission';
import ConfirmModal from './ConfirmModal';

type LocationPermissionModalProps = {
    /** A callback to call when the permission has been granted */
    onGrant: () => void;

    /** A callback to call when the permission has been denied */
    onDeny: (permission: PermissionStatus) => void;

    /** Should start the permission flow? */
    startPermissionFlow: boolean;
};

function LocationPermissionModal({startPermissionFlow, onDeny, onGrant}: LocationPermissionModalProps) {
    const [hasError, setHasError] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    useEffect(() => {
        if (!startPermissionFlow) {
            return;
        }

        getLocationPermissionStatus().then((status) => {
            if (status === RESULTS.GRANTED) {
                return onGrant();
            }

            setShowModal(true);
            setHasError(status === RESULTS.DENIED);
        });
    }, [startPermissionFlow, onGrant]);

    const onConfirm = () => {
        requestLocationPermission()
            .then((status) => {
                if (status === RESULTS.GRANTED) {
                    onGrant();
                } else {
                    onDeny(status);
                }
            })
            .catch(() => {
                onDeny(RESULTS.BLOCKED);
            })
            .finally(() => {
                setShowModal(false);
                setHasError(false);
            });
    };

    const onCancel = () => {
        onDeny(RESULTS.DENIED);
        setShowModal(false);
        setHasError(false);
    };

    return (
        <ConfirmModal
            isVisible={showModal}
            onConfirm={onConfirm}
            onCancel={onCancel}
            onModalHide={onCancel}
            confirmText={translate('common.continue')}
            cancelText={translate('common.notNow')}
            prompt={translate(hasError ? 'receipt.locationErrorMessage' : 'receipt.locationAccessMessage')}
            promptStyles={[styles.textLabelSupportingEmptyValue, styles.mb4]}
            title={translate(hasError ? 'receipt.locationErrorTitle' : 'receipt.locationAccessTitle')}
            titleContainerStyles={[styles.mt2, styles.mb0]}
            titleStyles={[styles.textHeadline]}
            iconSource={LocationMarker}
            iconWidth={140}
            iconHeight={120}
            shouldCenterIcon
            shouldShowDismissIcon
            shouldReverseStackedButtons
        />
    );
}

LocationPermissionModal.displayName = 'LocationPermissionModal';

export default LocationPermissionModal;
